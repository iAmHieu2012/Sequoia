package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CosmosService {
    suspend fun getCosmosMap(mapId: String): CosmosMap? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId).get().get()
        if (doc.exists()) {
            val m = doc.toObject(CosmosMap::class.java)
            m?.id = doc.id
            m
        } else null
    }

    suspend fun getUserProgress(userId: String): UserProgress = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("user_progress").document(userId).get().get()
        
        if (doc.exists()) {
            val p = doc.toObject(UserProgress::class.java)
            p?.id = doc.id
            p ?: UserProgress(id = userId, userId = userId)
        } else {
            UserProgress(id = userId, userId = userId)
        }
    }
}
