import React, { useCallback, useReducer, useState } from 'react';

const PostsContext = React.createContext();

export default PostsContext;

const postsReducer = (state, action) => {
  switch(action.type) {
    case "addPost": {
      const newPosts = [...state];
      action.posts.forEach((post) => {
        const exist = newPosts.find((newPost) => newPost._id === post._id);
        if (!exist) {
          newPosts.push(post);
        }
      });
      return newPosts;
    }
    case "deletePost": {
      const newPosts = [];
      state.forEach((post) => {
        if (post._id !== action.postId) {
          newPosts.push(post);
        }
      });
      return newPosts;
    }
    default:
      return state;
  }
}

export const PostsProvider = ({ children }) => {
  const [posts, dispatch] = useReducer(postsReducer, []);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const setPostsFromSSR = useCallback((postsFromSSR = []) => {
    dispatch({
      type: "addPost",
      posts: postsFromSSR
    });
  }, []);

  const deletePost = useCallback((postId) => {
    dispatch({
      type: "deletePost",
      postId
    });
  }, []);

  const getPost = useCallback(async({ lastPostDate, getNewerPosts = false }) => {
    try {
      const result = await fetch("/api/getPosts", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ lastPostDate, getNewerPosts })
      });
      const json = await result.json();
      const postsResult = json.posts;

      if (!postsResult.length < 3) setNoMorePosts(true);

      dispatch({
        type: "addPost",
        posts: postsResult
      });
    } catch (error) {
      console.log({error})
    }
  }, []);

  return <PostsContext.Provider value={{ posts, setPostsFromSSR, getPost, noMorePosts, deletePost }}>{children}</PostsContext.Provider>
}