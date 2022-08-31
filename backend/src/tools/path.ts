
export function getProjectDir() {
    return __dirname.replace(/(\/|\\)backend(?!.*(\/|\\)backend).*/i, '');
}

export function getBuildDir() {
    return `${getProjectDir()}/backend/build`;
}