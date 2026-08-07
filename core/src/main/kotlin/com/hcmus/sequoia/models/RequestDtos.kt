package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * DTO for creating a new Article and its associated CosmosNode.
 * 
 * @property title The title of the new article.
 * @property category The topic ID or "standalone" if it's a rogue anomaly.
 * @property summary A brief summary of the article.
 * @property content The markdown content of the article.
 * @property tags A list of relevant tags.
 * @property x The X coordinate of the article's node on the CosmosMap canvas.
 * @property y The Y coordinate of the article's node on the CosmosMap canvas.
 * @property connections List of article IDs that this node's light beam connects to.
 * @property celestialType The visual type of the node (e.g., "star", "anomaly").
 * @property isPublished Whether the article is live or draft.
 */
@Serializable
data class CreateArticleRequest(
    val id: String? = null,
    val title: String,
    val category: String = "",
    val summary: String = "",
    val content: String = "",
    val tags: List<String> = emptyList(),
    val x: Double = 0.0,
    val y: Double = 0.0,
    val connections: List<String> = emptyList(),
    val celestialType: String = "star",
    val isPublished: Boolean = true
)

/**
 * DTO for creating a new Topic (Nebula).
 * 
 * @property name The name of the new topic.
 * @property description A brief description of the topic.
 * @property sortOrder The display order ranking.
 */
@Serializable
data class CreateTopicRequest(
    val name: String,
    val description: String = "",
    val sortOrder: Int = 99
)

/**
 * DTO for creating a new AI Model for the Playground.
 * 
 * @property id The unique ID for the model.
 * @property name The display name of the model.
 * @property description A brief description of the model's purpose.
 * @property taskType The task this model performs (e.g., "object-detection").
 * @property fileUrl URL to download the model weights (e.g., .tflite).
 * @property metadataUrl URL to download the model's metadata JSON.
 * @property version The version string of the model.
 * @property format The format of the model file (default: "litert").
 * @property fileSizeBytes The size of the model file in bytes.
 */
@Serializable
data class CreateModelRequest(
    val id: String,
    val name: String,
    val description: String = "",
    val taskType: String = "",
    val fileUrl: String = "",
    val metadataUrl: String = "",
    val version: String = "1.0",
    val format: String = "litert",
    val fileSizeBytes: Long = 0L
)

/**
 * DTO for creating a new Textbook (Module).
 * 
 * @property id The unique ID for the textbook.
 * @property title The title of the textbook.
 * @property description A brief description of the textbook's content.
 * @property authors A list of authors who wrote or contributed to the textbook.
 * @property coverImageUrl URL to the textbook's cover image.
 * @property pdfUrl URL to the textbook's PDF file.
 * @property sortOrder The display order ranking.
 */
@Serializable
data class CreateTextbookRequest(
    val id: String,
    val title: String,
    val description: String = "",
    val authors: List<String> = emptyList(),
    val coverImageUrl: String = "",
    val pdfUrl: String = "",
    val sortOrder: Int = 99
)

/**
 * DTO for bulk updating the positions and connections of nodes in a CosmosMap.
 * 
 * @property nodes The list of updated celestial nodes.
 */
@Serializable
data class UpdateMapNodesRequest(
    val nodes: List<CosmosNode>
)
