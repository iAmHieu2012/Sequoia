package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a User in the Sequoia platform.
 * 
 * @property id The unique document ID (usually same as uid).
 * @property uid The unique user ID from Firebase Auth.
 * @property email The email address of the user.
 * @property displayName The display name of the user.
 * @property photoUrl URL to the user's avatar.
 * @property createdAt Timestamp when the user was created.
 * @property updatedAt Timestamp when the user profile was last updated.
 */
@Serializable
data class User(
    var id: String = "",
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val photoUrl: String = "",
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)
