
export function arrayRemove<T>(arr: T[], predicate: (item: T) => boolean): T[] {
    for (let i = 0; i < arr.length; i++)
        if (predicate(arr[i]))
            arr.splice(i, 1);
    return arr;
}