package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Tracks a user's global learning progress across the entire platform.
 * 
 * Stored as a single document per user. Using arrays to store completed and decoding article IDs
 * ensures that progress is decoupled from specific maps/textbooks and minimizes Firestore reads.
 *
 * @property id The unique document ID, always equal to the userId.
 * @property userId The ID of the user.
 * @property completedArticleIds List of article IDs the user has successfully finished/decoded.
 * @property decodingArticleIds List of article IDs the user is currently learning/analyzing.
 * @property lastActive Timestamp of the user's last learning activity.
 */
@Serializable
data class UserProgress(
    var id: String = "",
    val userId: String = "",
    val completedArticleIds: List<String> = emptyList(),
    val decodingArticleIds: List<String> = emptyList(),
    val lastActive: Long = 0L
)
