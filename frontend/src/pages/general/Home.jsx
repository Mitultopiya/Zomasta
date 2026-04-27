import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
import api, { getApiErrorMessage } from '../../lib/api'

const normalizeVideo = (item) => ({
    ...item,
    likeCount: Number(item.likeCount ?? item.likesCount ?? item.likes ?? 0),
    savesCount: Number(item.savesCount ?? item.bookmarks ?? item.saves ?? 0),
    commentsCount: Number(item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)),
    isLiked: Boolean(item.isLiked ?? item.liked),
    isSaved: Boolean(item.isSaved ?? item.saved),
})

const Home = () => {
    const [ videos, setVideos ] = useState([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ statusMessage, setStatusMessage ] = useState('')

    useEffect(() => {
        let isMounted = true

        async function loadVideos() {
            try {
                setIsLoading(true)
                setErrorMessage('')

                const response = await api.get('/api/food')

                if (!isMounted) return

                setVideos((response.data.foodItems ?? []).map(normalizeVideo))
            } catch (error) {
                if (!isMounted) return

                setVideos([])
                setErrorMessage(getApiErrorMessage(error, 'Unable to load videos right now.'))
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadVideos()

        return () => {
            isMounted = false
        }
    }, [])

    async function likeVideo(item) {
        try {
            const response = await api.post('/api/food/like', { foodId: item._id })
            const isLiked = Boolean(response.data.like)

            setStatusMessage('')

            setVideos((prev) => prev.map((v) => {
                if (v._id !== item._id) return v
                const currentLikes = Number(v.likeCount ?? 0)

                return {
                    ...v,
                    isLiked,
                    likeCount: isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
                }
            }))
        } catch (error) {
            setStatusMessage(
                error?.response?.status === 401 || error?.response?.status === 403
                    ? 'Please sign in to like videos.'
                    : getApiErrorMessage(error, 'Unable to update the like right now.')
            )
        }
    }

    async function saveVideo(item) {
        try {
            const response = await api.post('/api/food/save', { foodId: item._id })
            const isSaved = Boolean(response.data.save)

            setStatusMessage('')

            setVideos((prev) => prev.map((v) => {
                if (v._id !== item._id) return v
                const currentSaves = Number(v.savesCount ?? 0)

                return {
                    ...v,
                    isSaved,
                    savesCount: isSaved ? currentSaves + 1 : Math.max(0, currentSaves - 1),
                }
            }))
        } catch (error) {
            setStatusMessage(
                error?.response?.status === 401 || error?.response?.status === 403
                    ? 'Please sign in to save videos.'
                    : getApiErrorMessage(error, 'Unable to update the save right now.')
            )
        }
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage={isLoading ? 'Loading videos...' : (errorMessage || 'No videos available.')}
            statusMessage={statusMessage}
        />
    )
}

export default Home
