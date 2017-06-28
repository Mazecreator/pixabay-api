import axios from 'axios';
import * as QueryString from 'querystring';
import { ImageRequest } from './PixabayRequest';
import { ImageResponse } from './PixabayResponse';
import { VideoRequest } from './PixabayRequest';
import { VideoResponse } from './PixabayResponse';
import { validateRequest } from './ValidateRequest';

const PIXABAY_URL_IMAGES = 'https://pixabay.com/api/?';
const PIXABAY_URL_VIDEOS = 'https://pixabay.com/api/videos?';

/**
 * Search for images on pixabay
 * @param key - you can obtain your authentication key by sign up on pixabay
 * @param searchQuery - search for image names, should not exceed 100 characters
 * @param request - pixabay request options, for more information visit
 * @param validate - should validate request ? It'll throw an error if validation fail
 * @throws {BadResponse}
 */

const searchImagesRequest = async (key: string, searchQuery: string, options: ImageRequest = {}, validate = true) => {
    const requestData = {
        ...options,
        key,
        q: QueryString.stringify(searchQuery),
    };

    if (validate) {
        validateRequest(requestData);
    }
  
    const response = await axios.post(PIXABAY_URL + QueryString.stringify(requestData));
    const responseData = response.data;

    if (!responseData.hits && !responseData.total && !responseData.totalHits) {
        throw new Error(`BadResponse: hits total totalHits are missing. make sure that you have right access token.`);
    }
    return responseData as ImageResponse;
};

const searchVideosRequest = async (authenticateKey: string, searchQuery: string, options: VideoRequest = {}, validate: boolean = true) => {
    options.q = searchQuery;
    options.key = authenticateKey;
    if (validate) {
        validateRequest(options);
    }
    const response = (await axios.post(PIXABAY_URL_VIDEOS + QueryString.stringify(options))).data;
    if (!response.hits && !response.total && !response.totalHits) {
        // TODO: more descriptive error
        throw new Error('bad response');
    }
    return response as VideoResponse;
};

/**
 * Authenticate user. You'll no longer need to write auth key on every searchImages request
 * @param key - you can obtain your key by sign up on pixabay
 */
export const authenticate = (key: string) => ({
    /**
     * Search for images on pixabay
     * @param searchQuery - search for image names, should not exceed 100 characters
     * @param request - pixabay request options, for more information visit
     * @param validate - should validate request ? It'll throw an error if validation fail
     * @throws {BadResponse}
     */
    searchImages: async (searchQuery: string, request: ImageRequest = {}, validate: boolean = true) =>
        await searchImagesRequest(key, searchQuery, request, validate),
    searchVideos: async (searchQuery: string, request: VideoRequest = {}, validate: boolean = true) =>
        await searchVideosRequest(key, searchQuery, request, validate),
});
