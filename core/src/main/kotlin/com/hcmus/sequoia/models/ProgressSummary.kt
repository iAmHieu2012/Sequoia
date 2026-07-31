package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing the summarized progress of a user across all textbooks, topics, and standalone articles.
 *
 * @property topics Map of topic IDs to their respective progress.
 * @property standalone Map of standalone article IDs to their completion status (true if completed).
 */
@Serializable
data class ProgressSummary(
    val topics: Map<String, CategoryProgress> = emptyMap(),
    val standalone: Map<String, Boolean> = emptyMap()
)

/**
 * Data class representing the progress of a specific category (Textbook or Topic).
 *
 * @property total Total number of articles in the category.
 * @property completed Number of articles the user has completed in the category.
 */
@Serializable
data class CategoryProgress(
    val total: Int = 0,
    val completed: Int = 0
)
