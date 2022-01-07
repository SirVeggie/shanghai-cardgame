import axios from 'axios';

const timeout = 30000

export const getJsonResponse = async <T>(path: string, errorMode = ""): Promise<T> => {
    console.log("API JSON request to: ", path)

    try {
        const response = await axios.get(path, {
            timeout,
            headers: {
                'x-force-error-mode': errorMode
            }
        })
        return response.data as T
    } catch (e) {
        console.log("Error fetching JSON from API: ", e.message)
        throw e
    }
}

export const getSeconds = () => {
    return new Date().getTime() / 1000
}

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}