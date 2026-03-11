import { useState } from '@wordpress/element';
import { patternManager } from '../globals';
import getHeaders from '../utils/getHeaders';
import removePattern from '../utils/removePattern';
import type { Pattern, Patterns } from '../types';

export default function usePatterns( initialPatterns: Patterns ) {
	const [ patternsData, setPatternsData ] = useState( initialPatterns );

	function deletePattern( patternName: Pattern[ 'name' ] ) {
		setPatternsData( removePattern( patternName, patternsData ) );
		return fetch( patternManager.apiEndpoints.deletePatternEndpoint, {
			method: 'DELETE',
			headers: getHeaders(),
			body: JSON.stringify( { patternName } ),
		} );
	}

	async function updatePatternCategories(
		patternName: Pattern[ 'name' ],
		categories: string[]
	) {
		// Optimistic update.
		setPatternsData( {
			...patternsData,
			[ patternName ]: {
				...patternsData[ patternName ],
				categories,
			},
		} );

		return fetch(
			patternManager.apiEndpoints.updatePatternCategoriesEndpoint,
			{
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify( { patternName, categories } ),
			}
		);
	}

	return {
		data: patternsData,
		deletePattern,
		updatePatternCategories,
	};
}
