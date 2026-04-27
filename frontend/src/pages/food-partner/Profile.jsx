import React, { useState, useEffect } from 'react'
import '../../styles/profile.css'
import { useParams } from 'react-router-dom'
import api, { getApiErrorMessage } from '../../lib/api'

const Profile = () => {
    const { id } = useParams()
    const [ profile, setProfile ] = useState(null)
    const [ videos, setVideos ] = useState([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ errorMessage, setErrorMessage ] = useState('')

    useEffect(() => {
        let isMounted = true

        async function loadProfile() {
            try {
                setIsLoading(true)
                setErrorMessage('')

                const response = await api.get(`/api/food-partner/${id}`)

                if (!isMounted) return

                setProfile(response.data.foodPartner)
                setVideos(response.data.foodPartner.foodItems ?? [])
            } catch (error) {
                if (!isMounted) return

                setErrorMessage(getApiErrorMessage(error, 'Unable to load this food partner profile right now.'))
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadProfile()

        return () => {
            isMounted = false
        }
    }, [ id ])

    if (isLoading) {
        return (
            <main className="profile-page">
                <p className="profile-empty">Loading profile...</p>
            </main>
        )
    }

    if (errorMessage) {
        return (
            <main className="profile-page">
                <p className="profile-empty">{errorMessage}</p>
            </main>
        )
    }


    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-meta">

                    <img className="profile-avatar" src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D" alt="" />

                    <div className="profile-info">
                        <h1 className="profile-pill profile-business" title="Business name">
                            {profile?.name}
                        </h1>
                        <p className="profile-pill profile-address" title="Address">
                            {profile?.address}
                        </p>
                    </div>
                </div>

                <div className="profile-stats" role="list" aria-label="Stats">
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total meals</span>
                        <span className="profile-stat-value">{profile?.totalMeals ?? videos.length}</span>
                    </div>
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total saves</span>
                        <span className="profile-stat-value">{profile?.totalSaves ?? 0}</span>
                    </div>
                </div>
            </section>

            <hr className="profile-sep" />

            <section className="profile-grid" aria-label="Videos">
                {videos.length === 0 && (
                    <p className="profile-empty">No food videos have been uploaded yet.</p>
                )}

                {videos.map((v) => (
                    <div key={v._id} className="profile-grid-item">
                        <video
                            className="profile-grid-video"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            src={v.video}
                            controls
                            muted
                            playsInline
                            preload="metadata"
                        />
                    </div>
                ))}
            </section>
        </main>
    )
}

export default Profile
