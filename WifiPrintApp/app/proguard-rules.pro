# Retrofit 2
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes *Annotation*
-keepattributes RuntimeVisible*Annotations, RuntimeInvisible*Annotations
-keepattributes RuntimeVisible*ParameterAnnotations, RuntimeInvisible*ParameterAnnotations

-keep class retrofit2.** { *; }
-keep interface retrofit2.** { *; }
-dontwarn retrofit2.**
-dontwarn retrofit2.KotlinExtensions
-dontwarn retrofit2.KotlinExtensions$*

# Retain all API service interfaces, implementations and their methods completely
-keep interface com.wifiprint.app.data.api.** { *; }
-keep class com.wifiprint.app.data.api.** { *; }
-keepclassmembers interface com.wifiprint.app.data.api.** { *; }

-keepclasseswithmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Kotlin Coroutines
-keep class kotlin.coroutines.Continuation { *; }
-keep interface kotlin.coroutines.Continuation { *; }
-dontwarn kotlin.Unit

# OkHttp
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# Gson
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }
-keep interface com.google.gson.** { *; }
-dontwarn com.google.gson.**

# Models & Data classes (prevent field renaming/removal)
-keep class com.wifiprint.app.data.models.** { *; }
-keepclassmembers class com.wifiprint.app.data.models.** { *; }

# Room
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**
