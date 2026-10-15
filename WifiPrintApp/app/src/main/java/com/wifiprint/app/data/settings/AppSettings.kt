package com.wifiprint.app.data.settings

import android.content.Context
import androidx.core.content.edit
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages persistent user preferences and application settings using SharedPreferences.
 */
@Singleton
class AppSettings @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _notifications = MutableStateFlow(prefs.getBoolean(KEY_NOTIFICATIONS, true))
    val notifications: StateFlow<Boolean> = _notifications.asStateFlow()

    private val _autoConnect = MutableStateFlow(prefs.getBoolean(KEY_AUTO_CONNECT, true))
    val autoConnect: StateFlow<Boolean> = _autoConnect.asStateFlow()

    private val _highQualityPreview = MutableStateFlow(prefs.getBoolean(KEY_HQ_PREVIEW, true))
    val highQualityPreview: StateFlow<Boolean> = _highQualityPreview.asStateFlow()

    private val _autoCleanScans = MutableStateFlow(prefs.getBoolean(KEY_AUTO_CLEAN_SCANS, false))
    val autoCleanScans: StateFlow<Boolean> = _autoCleanScans.asStateFlow()

    fun setNotifications(enabled: Boolean) {
        _notifications.value = enabled
        prefs.edit { putBoolean(KEY_NOTIFICATIONS, enabled) }
    }

    fun setAutoConnect(enabled: Boolean) {
        _autoConnect.value = enabled
        prefs.edit { putBoolean(KEY_AUTO_CONNECT, enabled) }
    }

    fun setHighQualityPreview(enabled: Boolean) {
        _highQualityPreview.value = enabled
        prefs.edit { putBoolean(KEY_HQ_PREVIEW, enabled) }
    }

    fun setAutoCleanScans(enabled: Boolean) {
        _autoCleanScans.value = enabled
        prefs.edit { putBoolean(KEY_AUTO_CLEAN_SCANS, enabled) }
    }

    companion object {
        private const val PREFS_NAME = "wifiprint_app_settings"
        private const val KEY_NOTIFICATIONS = "notifications"
        private const val KEY_AUTO_CONNECT = "auto_connect"
        private const val KEY_HQ_PREVIEW = "high_quality_preview"
        private const val KEY_AUTO_CLEAN_SCANS = "auto_clean_scans"
    }
}
