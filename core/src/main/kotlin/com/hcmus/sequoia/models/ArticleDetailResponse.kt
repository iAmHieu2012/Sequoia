package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data Transfer Object representing the merged view of an Article and its Content.
 * Used for the GET /articles/:slug endpoint.
 */
@Serializable
data class ArticleDetailResponse(
    val id: String,
    val title: String,
    val slug: String,
    val summary: String,
    val content: String,
    val chapterId: String?,
    val topicId: String?,
    val textbookId: String?,
    val playgroundBlocks: List<PlaygroundBlock>,
    val tags: List<String>,
    val isPublished: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
    val publishedAt: Long
)
