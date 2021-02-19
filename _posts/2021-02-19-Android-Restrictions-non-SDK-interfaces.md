---
layout:     post
title:      Android Restrictions non-SDK interfaces
subtitle:   android 11 针对非SDK接口的限制
date:       2021-02-19
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - android
---

[针对非SDK接口的限制-Google](https://developer.android.google.cn/distribute/best-practices/develop/restrictions-non-sdk-interfaces?hl=zh-cn)

## 反射限制

### Class.java

代码基于android 11

```java

public final class Class<T> implements java.io.Serializable,
                              GenericDeclaration,
                              Type,
                              AnnotatedElement {
    @CallerSensitive
    public Method getMethod(String name, Class<?>... parameterTypes)
        throws NoSuchMethodException, SecurityException {
        return getMethod(name, parameterTypes, true);
    }

    @CallerSensitive
    public Method getDeclaredMethod(String name, Class<?>... parameterTypes)
        throws NoSuchMethodException, SecurityException {
        return getMethod(name, parameterTypes, false);
    }

    private Method getMethod(String name, Class<?>[] parameterTypes, boolean recursivePublicMethods)
            throws NoSuchMethodException {
        if (name == null) {
            throw new NullPointerException("name == null");
        }
        if (parameterTypes == null) {
            parameterTypes = EmptyArray.CLASS;
        }
        for (Class<?> c : parameterTypes) {
            if (c == null) {
                throw new NoSuchMethodException("parameter type is null");
            }
        }
        Method result = recursivePublicMethods ? getPublicMethodRecursive(name, parameterTypes)
                                               : getDeclaredMethodInternal(name, parameterTypes);
        // Fail if we didn't find the method or it was expected to be public.
        if (result == null ||
            (recursivePublicMethods && !Modifier.isPublic(result.getAccessFlags()))) {
            throw new NoSuchMethodException(getName() + "." + name + " "
                    + Arrays.toString(parameterTypes));
        }
        return result;
    }

    private Method getPublicMethodRecursive(String name, Class<?>[] parameterTypes) {
        // search superclasses
        for (Class<?> c = this; c != null; c = c.getSuperclass()) {
            Method result = c.getDeclaredMethodInternal(name, parameterTypes);
            if (result != null && Modifier.isPublic(result.getAccessFlags())) {
                return result;
            }
        }

        return findInterfaceMethod(name, parameterTypes);
    }

    /**
     * Returns the method if it is defined by this class; {@code null} otherwise. This may return a
     * non-public member.
     *
     * @param name the method name
     * @param args the method's parameter types
     */
    @FastNative
    private native Method getDeclaredMethodInternal(String name, Class<?>[] args);

}

```

### art/runtime/native/java_lang_Class.cc

```cc

static jobject Class_getDeclaredMethodInternal(JNIEnv* env, jobject javaThis,
                                               jstring name, jobjectArray args) {
  ScopedFastNativeObjectAccess soa(env);
  StackHandleScope<1> hs(soa.Self());
  DCHECK_EQ(Runtime::Current()->GetClassLinker()->GetImagePointerSize(), kRuntimePointerSize);
  DCHECK(!Runtime::Current()->IsActiveTransaction());
  ObjPtr<mirror::Class> klass = DecodeClass(soa, javaThis);
  if (UNLIKELY(klass->IsObsoleteObject())) {
    ThrowRuntimeException("Obsolete Object!");
    return nullptr;
  }
  Handle<mirror::Method> result = hs.NewHandle(
      mirror::Class::GetDeclaredMethodInternal<kRuntimePointerSize, false>(
          soa.Self(),
          klass,
          soa.Decode<mirror::String>(name),
          soa.Decode<mirror::ObjectArray<mirror::Class>>(args),
          GetHiddenapiAccessContextFunction(soa.Self())));
  // 检测该方法是否允许访问
  if (result == nullptr || ShouldDenyAccessToMember(result->GetArtMethod(), soa.Self())) {
    return nullptr;
  }
  return soa.AddLocalReference<jobject>(result.Get());
}

// Returns true if the first non-ClassClass caller up the stack should not be
// allowed access to `member`.
template<typename T>
ALWAYS_INLINE static bool ShouldDenyAccessToMember(T* member, Thread* self)
    REQUIRES_SHARED(Locks::mutator_lock_) {
  return hiddenapi::ShouldDenyAccessToMember(member,
                                             GetHiddenapiAccessContextFunction(self),
                                             hiddenapi::AccessMethod::kReflection);
}

```

### art/runtime/hidden_api.h

```h

namespace hiddenapi {

// Hidden API enforcement policy
// This must be kept in sync with ApplicationInfo.ApiEnforcementPolicy in
// frameworks/base/core/java/android/content/pm/ApplicationInfo.java
enum class EnforcementPolicy {
  kDisabled             = 0,
  kJustWarn             = 1,  // keep checks enabled, but allow everything (enables logging)
  kEnabled              = 2,  // ban dark grey & blacklist
  kMax = kEnabled,
};


// Hidden API access method
// Thist must be kept in sync with VMRuntime.HiddenApiUsageLogger.ACCESS_METHOD_*
enum class AccessMethod {
  kNone = 0,  // internal test that does not correspond to an actual access by app
  kReflection = 1,
  kJNI = 2,
  kLinking = 3,
};


// Returns true if access to `member` should be denied in the given context.
// The decision is based on whether the caller is in a trusted context or not.
// Because determining the access context can be expensive, a lambda function
// "fn_get_access_context" is lazily invoked after other criteria have been
// considered.
// This function might print warnings into the log if the member is hidden.
template<typename T>
inline bool ShouldDenyAccessToMember(T* member,
                                     const std::function<AccessContext()>& fn_get_access_context,
                                     AccessMethod access_method)
    REQUIRES_SHARED(Locks::mutator_lock_) {
  DCHECK(member != nullptr);

  // Get the runtime flags encoded in member's access flags.
  // Note: this works for proxy methods because they inherit access flags from their
  // respective interface methods.
  const uint32_t runtime_flags = GetRuntimeFlags(member);

  // Exit early if member is public API. This flag is also set for non-boot class
  // path fields/methods.
  if ((runtime_flags & kAccPublicApi) != 0) {
    return false;
  }

  // Determine which domain the caller and callee belong to.
  // This can be *very* expensive. This is why ShouldDenyAccessToMember
  // should not be called on every individual access.
  const AccessContext caller_context = fn_get_access_context();
  const AccessContext callee_context(member->GetDeclaringClass());

  // Non-boot classpath callers should have exited early.
  DCHECK(!callee_context.IsApplicationDomain());

  // Check if the caller is always allowed to access members in the callee context.
  if (caller_context.CanAlwaysAccess(callee_context)) {
    return false;
  }

  // Check if this is platform accessing core platform. We may warn if `member` is
  // not part of core platform API.
  switch (caller_context.GetDomain()) {
    case Domain::kApplication: {
      DCHECK(!callee_context.IsApplicationDomain());

      // Exit early if access checks are completely disabled.
      EnforcementPolicy policy = Runtime::Current()->GetHiddenApiEnforcementPolicy();
      if (policy == EnforcementPolicy::kDisabled) {
        return false;
      }

      // If this is a proxy method, look at the interface method instead.
      member = detail::GetInterfaceMemberIfProxy(member);

      // Decode hidden API access flags from the dex file.
      // This is an O(N) operation scaling with the number of fields/methods
      // in the class. Only do this on slow path and only do it once.
      ApiList api_list(detail::GetDexFlags(member));
      DCHECK(api_list.IsValid());

      // Member is hidden and caller is not exempted. Enter slow path.
      return detail::ShouldDenyAccessToMemberImpl(member, api_list, access_method);
    }

    case Domain::kPlatform: {
      DCHECK(callee_context.GetDomain() == Domain::kCorePlatform);

      // Member is part of core platform API. Accessing it is allowed.
      if ((runtime_flags & kAccCorePlatformApi) != 0) {
        return false;
      }

      // Allow access if access checks are disabled.
      EnforcementPolicy policy = Runtime::Current()->GetCorePlatformApiEnforcementPolicy();
      if (policy == EnforcementPolicy::kDisabled) {
        return false;
      }

      // If this is a proxy method, look at the interface method instead.
      member = detail::GetInterfaceMemberIfProxy(member);

      // Access checks are not disabled, report the violation.
      // This may also add kAccCorePlatformApi to the access flags of `member`
      // so as to not warn again on next access.
      return detail::HandleCorePlatformApiViolation(member,
                                                    caller_context,
                                                    access_method,
                                                    policy);
    }

    case Domain::kCorePlatform: {
      LOG(FATAL) << "CorePlatform domain should be allowed to access all domains";
      UNREACHABLE();
    }
  }
}

// Helper method for callers where access context can be determined beforehand.
// Wraps AccessContext in a lambda and passes it to the real ShouldDenyAccessToMember.
template<typename T>
inline bool ShouldDenyAccessToMember(T* member,
                                     const AccessContext& access_context,
                                     AccessMethod access_method)
    REQUIRES_SHARED(Locks::mutator_lock_) {
  return ShouldDenyAccessToMember(member, [&]() { return access_context; }, access_method);
}

}

```

### art/runtime/hidden_api.cc

```cc

template<typename T>
bool ShouldDenyAccessToMemberImpl(T* member, ApiList api_list, AccessMethod access_method) {
  DCHECK(member != nullptr);
  Runtime* runtime = Runtime::Current();

  // 1
  EnforcementPolicy hiddenApiPolicy = runtime->GetHiddenApiEnforcementPolicy();
  DCHECK(hiddenApiPolicy != EnforcementPolicy::kDisabled)
      << "Should never enter this function when access checks are completely disabled";

  MemberSignature member_signature(member);

  // Check for an exemption first. Exempted APIs are treated as white list.
  if (member_signature.DoesPrefixMatchAny(runtime->GetHiddenApiExemptions())) {
    // Avoid re-examining the exemption list next time.
    // Note this results in no warning for the member, which seems like what one would expect.
    // Exemptions effectively adds new members to the whitelist.
    MaybeUpdateAccessFlags(runtime, member, kAccPublicApi);
    return false;
  }


  // 2
  EnforcementPolicy testApiPolicy = runtime->GetTestApiEnforcementPolicy();

  bool deny_access = false;
  if (hiddenApiPolicy == EnforcementPolicy::kEnabled) {
    if (testApiPolicy == EnforcementPolicy::kDisabled && api_list.IsTestApi()) {
      deny_access = false;
    } else {
      switch (api_list.GetMaxAllowedSdkVersion()) {
        case SdkVersion::kP:
          deny_access = runtime->isChangeEnabled(kHideMaxtargetsdkPHiddenApis);
          break;
        case SdkVersion::kQ:
          deny_access = runtime->isChangeEnabled(kHideMaxtargetsdkQHiddenApis);
          break;
        default:
          deny_access = IsSdkVersionSetAndMoreThan(runtime->GetTargetSdkVersion(),
                                                         api_list.GetMaxAllowedSdkVersion());
      }
    }
  }

  if (access_method != AccessMethod::kNone) {
    // Warn if non-greylisted signature is being accessed or it is not exempted.
    if (deny_access || !member_signature.DoesPrefixMatchAny(kWarningExemptions)) {
      // Print a log message with information about this class member access.
      // We do this if we're about to deny access, or the app is debuggable.
      if (kLogAllAccesses || deny_access || runtime->IsJavaDebuggable()) {
        member_signature.WarnAboutAccess(access_method, api_list, deny_access);
      }

      // If there is a StrictMode listener, notify it about this violation.
      member_signature.NotifyHiddenApiListener(access_method);
    }

    // If event log sampling is enabled, report this violation.
    if (kIsTargetBuild && !kIsTargetLinux) {
      uint32_t eventLogSampleRate = runtime->GetHiddenApiEventLogSampleRate();
      // Assert that RAND_MAX is big enough, to ensure sampling below works as expected.
      static_assert(RAND_MAX >= 0xffff, "RAND_MAX too small");
      if (eventLogSampleRate != 0) {
        const uint32_t sampled_value = static_cast<uint32_t>(std::rand()) & 0xffff;
        if (sampled_value < eventLogSampleRate) {
          member_signature.LogAccessToEventLog(sampled_value, access_method, deny_access);
        }
      }
    }

    // If this access was not denied, move the member into whitelist and skip
    // the warning the next time the member is accessed.
    if (!deny_access) {
      MaybeUpdateAccessFlags(runtime, member, kAccPublicApi);
    }
  }

  return deny_access;
}

```

## hiddenapi-package-whitelist.xml

frameworks/base/data/etc/hiddenapi-package-whitelist.xml

```xml

<config>
  <hidden-api-whitelisted-app package="android.ext.services" />
  <hidden-api-whitelisted-app package="com.android.apps.tag" />
  <hidden-api-whitelisted-app package="com.android.basicsmsreceiver" />
  <hidden-api-whitelisted-app package="com.android.bookmarkprovider" />
  <hidden-api-whitelisted-app package="com.android.calllogbackup" />
  <hidden-api-whitelisted-app package="com.android.camera" />
  <hidden-api-whitelisted-app package="com.android.car.dialer" />
  <hidden-api-whitelisted-app package="com.android.car.messenger" />
  <hidden-api-whitelisted-app package="com.android.car.overview" />
  <hidden-api-whitelisted-app package="com.android.car.stream" />
  <hidden-api-whitelisted-app package="com.android.companiondevicemanager" />
  <hidden-api-whitelisted-app package="com.android.dreams.basic" />
  <hidden-api-whitelisted-app package="com.android.gallery" />
  <hidden-api-whitelisted-app package="com.android.launcher3" />
  <hidden-api-whitelisted-app package="com.android.mtp" />
  <hidden-api-whitelisted-app package="com.android.musicfx" />
  <hidden-api-whitelisted-app package="com.android.permissioncontroller" />
  <hidden-api-whitelisted-app package="com.android.printservice.recommendation" />
  <hidden-api-whitelisted-app package="com.android.printspooler" />
  <hidden-api-whitelisted-app package="com.android.providers.blockednumber" />
  <hidden-api-whitelisted-app package="com.android.providers.calendar" />
  <hidden-api-whitelisted-app package="com.android.providers.contacts" />
  <hidden-api-whitelisted-app package="com.android.providers.downloads" />
  <hidden-api-whitelisted-app package="com.android.providers.downloads.ui" />
  <hidden-api-whitelisted-app package="com.android.providers.media" />
  <hidden-api-whitelisted-app package="com.android.providers.tv" />
  <hidden-api-whitelisted-app package="com.android.providers.userdictionary" />
  <hidden-api-whitelisted-app package="com.android.smspush" />
  <hidden-api-whitelisted-app package="com.android.spare_parts" />
  <hidden-api-whitelisted-app package="com.android.statementservice" />
  <hidden-api-whitelisted-app package="com.android.storagemanager" />
  <hidden-api-whitelisted-app package="com.android.systemui.plugins" />
  <hidden-api-whitelisted-app package="com.android.terminal" />
  <hidden-api-whitelisted-app package="com.android.wallpaper" />
  <hidden-api-whitelisted-app package="jp.co.omronsoft.openwnn" />
  <!-- TODO: Remove NetworkStack whitelisting -->
  <hidden-api-whitelisted-app package="com.android.networkstack" />
</config>

```

## Config

```txt

./frameworks/base/config/hiddenapi-greylist-max-q.txt
./frameworks/base/config/hiddenapi-force-blacklist.txt
./frameworks/base/config/hiddenapi-greylist.txt
./frameworks/base/config/hiddenapi-greylist-max-o.txt
./frameworks/base/config/hiddenapi-greylist-max-p.txt
./frameworks/base/config/hiddenapi-greylist-packages.txt

```

## SystemConfig

```java

public class SystemConfig {

    // Package names that are exempted from private API blacklisting
    final ArraySet<String> mHiddenApiPackageWhitelist = new ArraySet<>();

    public ArraySet<String> getHiddenApiWhitelistedApps() {
        return mHiddenApiPackageWhitelist;
    }

    private void readPermissionsFromXml(File permFile, int permissionFlag) {
        ---------------------------------------------------------------------
                    case "hidden-api-whitelisted-app": {
                        if (allowApiWhitelisting) {
                            String pkgname = parser.getAttributeValue(null, "package");
                            if (pkgname == null) {
                                Slog.w(TAG, "<" + name + "> without package in "
                                        + permFile + " at " + parser.getPositionDescription());
                            } else {
                                mHiddenApiPackageWhitelist.add(pkgname);
                            }
                        } else {
                            logNotAllowedInPartition(name, permFile, parser);
                        }
                        XmlUtils.skipCurrentTag(parser);
                    } break;
        ----------------------------------------------------------------------
    }

}

```

### AndroidPackageUtils

```java

/** @hide */
public class AndroidPackageUtils {

    public static int getHiddenApiEnforcementPolicy(AndroidPackage pkg,
            @NonNull PackageSetting pkgSetting) {
        boolean isAllowedToUseHiddenApis;
        if (pkg.isSignedWithPlatformKey()) {
            isAllowedToUseHiddenApis = true;
        } else if (pkg.isSystem() || pkgSetting.getPkgState().isUpdatedSystemApp()) {
            isAllowedToUseHiddenApis = pkg.isUsesNonSdkApi()
                    || SystemConfig.getInstance().getHiddenApiWhitelistedApps().contains(
                    pkg.getPackageName());
        } else {
            isAllowedToUseHiddenApis = false;
        }

        if (isAllowedToUseHiddenApis) {
            return ApplicationInfo.HIDDEN_API_ENFORCEMENT_DISABLED;
        }

        // TODO(b/135203078): Handle maybeUpdateHiddenApiEnforcementPolicy. Right now it's done
        //  entirely through ApplicationInfo and shouldn't touch this specific class, but that
        //  may not always hold true.
//        if (mHiddenApiPolicy != ApplicationInfo.HIDDEN_API_ENFORCEMENT_DEFAULT) {
//            return mHiddenApiPolicy;
//        }
        return ApplicationInfo.HIDDEN_API_ENFORCEMENT_ENABLED;
    }

}

```




