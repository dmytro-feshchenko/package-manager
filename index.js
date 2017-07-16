import fetch from 'node-fetch';
import semver from 'semver';
import fs from 'fs-extra';

/**
 * Downloads package from Internet
 * @param   {string} name        Name of the package
 * @param   {string} reference   Version or URL to the package
 * @returns {Promise|*}
 */
async function fetchPackage({ name, reference }) {
    // checks if the given reference is a file path
    if (['/', './', '../'].some(prefix => reference.startsWith(prefix))) {
        return await fs.readFile(reference);
    }
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

/**
 * Returns pinned version by the package name and version syntax
 *
 * Usage:
 *      getPinnedReference({name: "node", reference: "~6.0.0"})
 *      => {name: "node", reference: "6.0.4"}
 *
 *      getPinnedReference({name: "node", reference: "6.0.0"})
 *      => {name: "node", reference: "6.0.0"}
 *
 *      getPinnedReference({name: "node", reference: "/usr/bin/node.tar.gz"})
 *      => {name: "node", reference: "/usr/bin/node.tar.gz"}
 * 
 * @param   {string} name        Name of the package
 * @param   {string} reference   Version or URL to the package
 * @returns {{name: *, reference: *}}
 */
async function getPinnedReference({ name, reference }) {
    // we should omit already pinned versions (e.g., 1.0.0)
    if (semver.validRange(reference) && !semver.valid(reference)) {
        let response = await fetch(`https://registry.yarnpkg.com/${name}`);
        let info = await response.json();

        let versions = Object.keys(info.versions);
        let maxSatisfying = semver.maxSatisfying(versions, reference);

        if (maxSatisfying === null) {
            throw new Error(`Couldn't find a version matching "${reference}" for package "${name}"`);
        }

        reference = maxSatisfying;
    }
    return { name, reference };
}