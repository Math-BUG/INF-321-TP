"use client"

import { useEffect, useState } from "react"
import { Post } from "../posts/page";

export default function Test() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('https://dummyjson.com/posts')
        .then(res => res.json())
        .then((data: any) => {
            console.log(data);
            setPosts(data.posts)
        });
    }, []);

    return (
        <div>
            <h1 className="text-center mt-5 mb-2 font-bold text-3xl">TEST</h1>
            <div className="flex flex-col gap-4 p-10">
                {posts.map((post: Post) => (
                    <div key={post.id} className="bg-gray-200 p-4 rounded-md">
                        <h2 className="font-bold">{post.title}</h2>
                        <p>{post.body}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}