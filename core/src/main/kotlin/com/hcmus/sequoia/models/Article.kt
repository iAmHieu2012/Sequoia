package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing an Article (Metadata only).
 * 
 * @property id The Firestore document ID (slug-formatted, e.g. "image-classification").
 * @property title Title of the article.
 * @property summary Short summary.
 * @property topicId Optional reference to a topic's document ID.
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
    val summary: String = "",
    val topicId: String? = null,
    val tags: List<String> = emptyList(),
    @get:com.google.cloud.firestore.annotation.PropertyName("isPublished")
    @set:com.google.cloud.firestore.annotation.PropertyName("isPublished")
    var isPublished: Boolean = false,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
    val publishedAt: Long = 0L
)
