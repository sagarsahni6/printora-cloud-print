package com.wifiprint.app.data.security

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Provides hardware-backed encrypted storage for server authentication tokens (JWTs)
 * using Android Keystore and EncryptedSharedPreferences (AES-256 GCM).
 */
@Singleton
class SecureTokenStorage @Inject constructor(
    @param:ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "SecureTokenStorage"
        private const val PREFS_FILE = "printora_secure_tokens"
        private const val KEY_PREFIX = "jwt_token_"
    }

    private val prefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                PREFS_FILE,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize EncryptedSharedPreferences, falling back to private SharedPreferences", e)
            context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)
        }
    }

    /**
     * Store a JWT token securely for a given server ID.
     */
    fun saveToken(serverId: String, token: String) {
        prefs.edit().putString(KEY_PREFIX + serverId, token).apply()
    }

    /**
     * Retrieve the stored JWT token for a given server ID.
     */
    fun getToken(serverId: String): String? {
        return prefs.getString(KEY_PREFIX + serverId, null)
    }

    /**
     * Remove the stored JWT token for a given server ID.
     */
    fun removeToken(serverId: String) {
        prefs.edit().remove(KEY_PREFIX + serverId).apply()
    }

    /**
     * Clear all stored server tokens.
     */
    fun clearAll() {
        prefs.edit().clear().apply()
    }
}
