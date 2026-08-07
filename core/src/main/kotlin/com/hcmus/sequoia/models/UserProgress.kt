package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Tracks a user's global learning progress across the entire platform.
 * 
 * Stored as a single document per user. Using arrays to store completed article IDs
 * ensures that progress is decoupled from specific maps/textbooks and minimizes Firestore reads.
 *
 * @property id The Firestore document ID, always equal to the userId.
 * @property userId The ID of the user.
 * @property completedArticleIds List of article IDs the user has completed.
 * @property currentStreak The number of consecutive days the user has been active.
 * @property longestStreak The user's highest recorded streak.
 * @property activeDates A chronological log of active dates in YYYY-MM-DD format (local timezone).
 * @property lastActive Timestamp of the user's last learning activity in epoch milliseconds.
 */
@Serializable
data class UserProgress(
    var id: String = "",
    val userId: String = "",
    val completedArticleIds: List<String> = emptyList(),
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val activeDates: List<String> = emptyList(),
    val lastActive: Long = 0L
)
