package com.wifiprint.app.data.intent

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.OpenableColumns
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

data class IncomingFile(
    val uri: Uri,
    val name: String
)

/**
 * Handles incoming shared files from Android intents (ACTION_SEND, ACTION_SEND_MULTIPLE, ACTION_VIEW).
 * Provides a reactive StateFlow consumed by the Print screen.
 */
@Singleton
class IncomingIntentManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "IncomingIntent"
    }

    private val _incomingFiles = MutableStateFlow<List<IncomingFile>?>(null)
    val incomingFiles: StateFlow<List<IncomingFile>?> = _incomingFiles.asStateFlow()

    fun handleIntent(intent: Intent?) {
        if (intent == null) return
        val action = intent.action ?: return

        when (action) {
            Intent.ACTION_SEND -> {
                val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_STREAM)
                } ?: intent.data

                if (uri != null) {
                    val name = resolveFileName(uri)
                    Log.d(TAG, "Received ACTION_SEND with file: $name ($uri)")
                    _incomingFiles.value = listOf(IncomingFile(uri, name))
                }
            }

            Intent.ACTION_SEND_MULTIPLE -> {
                val uris = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM)
                }

                val validFiles = uris?.filterNotNull()?.map { uri ->
                    IncomingFile(uri, resolveFileName(uri))
                } ?: emptyList()

                if (validFiles.isNotEmpty()) {
                    Log.d(TAG, "Received ACTION_SEND_MULTIPLE with ${validFiles.size} files")
                    _incomingFiles.value = validFiles
                }
            }

            Intent.ACTION_VIEW -> {
                val uri = intent.data
                if (uri != null) {
                    val name = resolveFileName(uri)
                    Log.d(TAG, "Received ACTION_VIEW with file: $name ($uri)")
                    _incomingFiles.value = listOf(IncomingFile(uri, name))
                }
            }
        }
    }

    fun consumeIncomingFiles(): List<IncomingFile>? {
        val files = _incomingFiles.value
        _incomingFiles.value = null
        return files
    }

    private fun resolveFileName(uri: Uri): String {
        return try {
            context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (idx != -1) cursor.getString(idx) else null
                } else null
            } ?: uri.lastPathSegment?.substringAfterLast('/') ?: "shared_document"
        } catch (_: Exception) {
            uri.lastPathSegment?.substringAfterLast('/') ?: "shared_document"
        }
    }
}
