import fetch from 'node-fetch';

/**
 * Downloads package from Internet
 * @param reference
 * @returns {Promise|*}
 */
async function fetchPackage(reference) {

    let response = await fetch(reference);

    if (!response.ok) {
        throw new Error(`Could not fetch package ${reference}`)
    }

    return await response.buffer();
}