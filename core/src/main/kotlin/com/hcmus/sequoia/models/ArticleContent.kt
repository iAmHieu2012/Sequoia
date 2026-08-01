package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable


/**
 * Data class representing the heavy content of an Article.
 * Maps to the 'article_contents' collection in Firestore.
 * 
 * @property id The unique document ID, matching the Article's ID.
 * @property content Markdown content of the article.
 */
@Serializable
data class ArticleContent(
    var id: String = "",
    val content: String = ""
)
