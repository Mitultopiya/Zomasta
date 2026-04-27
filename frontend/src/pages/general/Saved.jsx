import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import { useNavigate } from 'react-router-dom'
import ReelFeed from '../../components/ReelFeed'
import api, { getApiErrorMessage } from '../../lib/api'

const normalizeSavedVideo = (item) => ({
    _id: item.food._id,
    video: item.food.video,
    description: item.food.description,
    likeCount: Number(item.food.likeCount ?? item.food.likesCount ?? item.food.likes ?? 0),
    savesCount: Number(item.food.savesCount ?? item.food.bookmarks ?? item.food.saves ?? 0),
    commentsCount: Number(item.food.commentsCount ?? (Array.isArray(item.food.comments) ? item.food.comments.length : 0)),
    foodPartner: item.food.foodPartner,
    isSaved: true,
    isLiked: Boolean(item.food.isLiked ?? item.food.liked),
})

const Saved = () => {
    const [ videos, setVideos ] = useState([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ statusMessage, setStatusMessage ] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        let isMounted = true

        async function loadSavedVideos() {
            try {
                setIsLoading(true)
                setErrorMessage('')

                const response = await api.get('/api/food/save')

                if (!isMounted) return

                const savedFoods = (response.data.savedFoods ?? []).map(normalizeSavedVideo)
                setVideos(savedFoods)
            } catch (error) {
                if (!isMounted) return

                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    navigate('/user/login')
                    return
                }

                setVideos([])
                setErrorMessage(getApiErrorMessage(error, 'Unable to load saved videos right now.'))
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadSavedVideos()

        return () => {
            isMounted = false
        }
    }, [navigate])

    const toggleLike = async (item) => {
        try {
            const response = await api.post('/api/food/like', { foodId: item._id })
            const isLiked = Boolean(response.data.like)

            setStatusMessage('')
            setVideos((prev) => prev.map((v) => (
                v._id === item._id
                    ? {
                        ...v,
                        isLiked,
                        likeCount: isLiked
                            ? Number(v.likeCount ?? 0) + 1
                            : Math.max(0, Number(v.likeCount ?? 0) - 1),
                    }
                    : v
            )))
        } catch (error) {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                navigate('/user/login')
                return
            }

            setStatusMessage(getApiErrorMessage(error, 'Unable to update the like right now.'))
        }
    }

    const removeSaved = async (item) => {
        try {
            const response = await api.post('/api/food/save', { foodId: item._id })

            setStatusMessage('')

            if (response.data.save) {
                setVideos((prev) => prev.map((v) => (
                    v._id === item._id
                        ? { ...v, isSaved: true, savesCount: Number(v.savesCount ?? 0) + 1 }
                        : v
                )))
                return
            }

            setVideos((prev) => prev.filter((v) => v._id !== item._id))
        } catch (error) {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                navigate('/user/login')
                return
            }

            setStatusMessage(getApiErrorMessage(error, 'Unable to update the saved video right now.'))
        }
    }

    return (
        <ReelFeed
            items={videos}
            onLike={toggleLike}
            onSave={removeSaved}
            emptyMessage={isLoading ? 'Loading saved videos...' : (errorMessage || 'No saved videos yet.')}
            statusMessage={statusMessage}
        />
    )
}

export default Saved
