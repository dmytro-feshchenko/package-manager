import fetch from 'node-fetch';
import semver from 'semver';
import fs from 'fs-extra';

/**
 * Downloads package from Internet
 * @param   name
 * @param   reference
 * @returns {Promise|*}
 */
async function fetchPackage({ name, reference }) {
    // checks if a given reference is a valid version
    if (semver.valid(reference)) {
        // we should to convert the given reference to URL for downloading from Yarn
        // package manager repository
        return await(fetchPackage({
            name,
            reference: `https://registry.yarnpkg.com/${name}/-/${name}-${reference}.tgz`
        }))
    }

    let response = await fetch(reference);

    if (!response.ok) {
        throw new Error(`Could not fetch package ${reference}`)
    }

    return await response.buffer();
}