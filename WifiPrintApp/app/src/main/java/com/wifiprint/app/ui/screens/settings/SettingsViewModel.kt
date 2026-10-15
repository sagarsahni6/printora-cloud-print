package com.wifiprint.app.ui.screens.settings

import androidx.lifecycle.ViewModel
import com.wifiprint.app.data.settings.AppSettings
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val appSettings: AppSettings
) : ViewModel() {

    val notifications: StateFlow<Boolean> = appSettings.notifications
    val autoConnect: StateFlow<Boolean> = appSettings.autoConnect
    val highQualityPreview: StateFlow<Boolean> = appSettings.highQualityPreview
    val autoCleanScans: StateFlow<Boolean> = appSettings.autoCleanScans

    fun setNotifications(enabled: Boolean) = appSettings.setNotifications(enabled)
    fun setAutoConnect(enabled: Boolean) = appSettings.setAutoConnect(enabled)
    fun setHighQualityPreview(enabled: Boolean) = appSettings.setHighQualityPreview(enabled)
    fun setAutoCleanScans(enabled: Boolean) = appSettings.setAutoCleanScans(enabled)
}
