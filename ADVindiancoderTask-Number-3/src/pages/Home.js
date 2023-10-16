import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../fbase-config";

function Home({ isAuth }) {
    const [postLists, setPostList] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);


    const postsCollectionRef = collection(db, "posts");

    useEffect(() => {
        const getPosts = async () => {
            const data = await getDocs(postsCollectionRef);
            setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getPosts();
    }, []);

    const deletePost = async (id) => {
        const postDoc = doc(db, "posts", id)
        await deleteDoc(postDoc)
    };

    const startEditing = (id, postText) => {
        setIsEditing(true);
        setEditText(postText);
        setEditingPostId(id);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditText("");
        setEditingPostId(null);
    };

    const saveEditedPost = async () => {
        const postDoc = doc(db, "posts", editingPostId);
        await updateDoc(postDoc, {
            postText: editText,
        });

        // Refresh the posts after editing
        const data = await getDocs(postsCollectionRef);
        setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

        setIsEditing(false);
        setEditText("");
        setEditingPostId(null);
    };

    return (
        <div className="homePage">
            {postLists.map((post) => {
                return (
                    <div className="post">
                        <div className="postHeader">
                            <div className="title">
                                <h1>{post.title}</h1>
                            </div>
                            <div className="editPost">
                                {isAuth && post.author.id === auth.currentUser.uid && (
                                    <div>
                                        <button onClick={() => startEditing(post.id, post.postText)}>
                                            Edit
                                        </button></div>)}

                                {isAuth && post.author.id === auth.currentUser.uid && (
                                    <div className="deletePost"><button onClick={() => { deletePost(post.id) }}>&#128465;</button>
                                    </div>
                                )}
                            </div>
                            {isEditing && editingPostId === post.id ? (
                                <div>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                    />
                                    <div className="saveCancel">
                                        <button onClick={saveEditedPost}>Save</button>
                                        <button onClick={cancelEditing}>Cancel</button></div>
                                </div>

                            ) : (
                                <div className="postTextContainer">{post.postText}</div>
                            )}
                            <div>
                                <h3>@{post.author.name}</h3></div>
                        </div>
                    </div>
                );
            })

            }
        </div>

    );
};

export default Home;
