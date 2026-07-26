package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing an Article (Metadata only).
 * 
 * @property id The unique document ID from Firestore.
 * @property title Title of the article.
 * @property slug URL-friendly slug.
 * @property summary Short summary.
 * @property chapterId Optional reference to a chapter.
 * @property topicId Optional reference to a topic.
 * @property textbookId Optional reference to a textbook.
 * @property tags List of tags for searching and filtering.
 * @property isPublished Boolean indicating if it is published.
 * @property createdAt Timestamp when the article was created.
 * @property updatedAt Timestamp when the article was last updated.
 * @property publishedAt Timestamp when the article was published.
 */
@Serializable
data class Article(
    var id: String = "",
    val title: String = "",
    val slug: String = "",
    val summary: String = "",
    val chapterId: String? = null,
    val topicId: String? = null,
    val textbookId: String? = null,
    val tags: List<String> = emptyList(),
    @get:com.google.cloud.firestore.annotation.PropertyName("isPublished")
    @set:com.google.cloud.firestore.annotation.PropertyName("isPublished")
    var isPublished: Boolean = false,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
    val publishedAt: Long = 0L
)
