import axios from 'axios';
import {
    GET_POSTS,
    POST_ERROR,
    UPDATE_LIKES
} from './types';
import {setAlert} from './alert';;


//get posts
export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/posts');

        dispatch({
            type: GET_POSTS,
            payload:res.data
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload:{msg: err.response.statusText, status: err.response.status}
        });
    }
}

//add like
export const addLike = (id) => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/like/${id}`);

        dispatch({
            type: UPDATE_LIKES,
            payload:{id, likes: res.data}
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload:{msg: err.response.statusText, status: err.response.status}
        });
    }
}

//remove like
export const removeLike = (id) => async dispatch => {
    try {
        const res = await axios.delete(`/api/posts/unlike/${id}`);

        dispatch({
            type: UPDATE_LIKES,
            payload:{id, likes: res.data}
        });
    } catch (err) {
        console.error(err);
        dispatch({
            type: POST_ERROR,
            payload:{msg: err.response.statusText, status: err.response.status}
        });
    }
}