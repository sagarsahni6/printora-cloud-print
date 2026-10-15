package com.wifiprint.app.ui.screens.printers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wifiprint.app.data.models.PrinterInfo
import com.wifiprint.app.data.repository.PrintRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PrinterViewModel @Inject constructor(
    private val repository: PrintRepository
) : ViewModel() {

    val printers: StateFlow<List<PrinterInfo>> = repository.printers

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    init { loadPrinters(force = false) }

    fun loadPrinters(force: Boolean = true) {
        _isLoading.value = true
        _error.value = null
        viewModelScope.launch {
            repository.getPrinters(forceRefresh = force).fold(
                onSuccess = { /* Automatically updates repository.printers StateFlow */ },
                onFailure = { e -> _error.value = e.message ?: "Failed to load printers" }
            )
            _isLoading.value = false
        }
    }
}

