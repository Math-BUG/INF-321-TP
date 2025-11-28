export interface Post {
    id: number;
    title: string;
    body: string;
    tags: Array<string>;
    reactions: {
        likes: number;
        dislikes: number;
    };
    views: number;
    userId: number;
};

export interface Response {
    posts: Array<Post>;
};

export default async function Posts() {
    const response = await fetch('https://dummyjson.com/posts');
    const data: Response = await response.json();

    console.log(data.posts[0].reactions.likes);

    return (<div>
        <h1 className="text-center mt-5 mb-2 font-bold text-3xl">POSTS</h1>
        <div className="flex flex-col gap-4 p-10">
            {data.posts.map((post) => (
                <div key={post.id} className="bg-gray-200 p-4 rounded-md">
                    <h2 className="font-bold">{post.title}</h2>
                    <p>{post.body}</p>
                </div>
            ))}
        </div>
    </div>);
}