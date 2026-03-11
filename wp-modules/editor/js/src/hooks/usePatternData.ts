import flatUnorderedEquals from '../utils/flatUnorderedEquals';
import sortAlphabetically from '../utils/sortAlphabetically';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { PostMeta, SelectQuery } from '../types';
import addNewCategory from '../utils/addNewCategory';
import { patternManager } from '../globals';

export default function usePatternData( postMeta: PostMeta ) {
	const { editPost } = useDispatch( 'core/editor' );

	/**
	 * Get, filter, and sort the custom post types, mapped for react-select.
	 * Wrapping call in useSelect to prevent async null return on initial load.
	 *
	 * 'core/post-content' in 'Block Types' header always displays for 'page' post type.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/core-blocks/
	 */
	const postTypes = useSelect( ( select: SelectQuery ) => {
		const rawTypes = select( 'core' ).getPostTypes( { per_page: -1 } );
		if ( ! rawTypes ) return;
		return sortAlphabetically(
			rawTypes
				.filter( ( postType ) => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const v = ( postType as any ).visibility;
					// The REST API visibility object exposes show_ui and
					// show_in_nav_menus. Post types intended for real content
					// (post, page, CPTs) have both set to true. Internal system
					// types (wp_template, wp_font_face, attachment, nav_menu_item,
					// etc.) always have show_in_nav_menus: false, so this filter
					// excludes them without a static blocklist.
					return (
						v?.show_ui &&
						v?.show_in_nav_menus &&
						postType.slug !== 'pm_pattern'
					);
				} )
				.map( ( postType ) => ( {
					label: postType.name,
					value: postType.slug,
				} ) ),
			'label'
		);
	}, [] );

	/**
	 * Alphabetized block pattern categories for the site editor, mapped for react-select.
	 * Registered and newly added custom categories are included.
	 * Needed for including new categories before the post is saved.
	 */
	const combinedCategories = sortAlphabetically(
		addNewCategory(
			patternManager.patternCategories,
			postMeta.customCategories
		),
		'label'
	);

	/**
	 * The alphabetized list of transformable block types, mapped for react-select.
	 * Template-part types are added to support template part replacement in site editor.
	 */
	const blockTypes = useSelect( ( select: SelectQuery ) => {
		const registeredBlockTypes = [
			...select( 'core/blocks' )
				.getBlockTypes()
				.map( ( blockType ) => ( {
					label: blockType.name, // blockType.title also available
					value: blockType.name,
					// Only add the transforms property if it exists.
					...( blockType.transforms && {
						transforms: blockType.transforms,
					} ),
				} ) ),
			{
				label: 'core/query',
				value: 'core/query',
				transforms: {},
			},
			{
				label: 'core/template-part/header',
				value: 'core/template-part/header',
				transforms: {},
			},
			{
				label: 'core/template-part/footer',
				value: 'core/template-part/footer',
				transforms: {},
			},
		];

		return sortAlphabetically(
			registeredBlockTypes.filter(
				( blockType ) => blockType.transforms
			),
			'label'
		);
	}, [] );

	// Filter out non-existing post types that were previously saved to the pattern file.
	// Prevents empty options from rendering in the dropdown list.
	const filteredPostTypes = postTypes
		?.map( ( postType ) => {
			return postMeta?.postTypes?.includes( postType?.value )
				? postType?.value
				: '';
		} )
		.filter( Boolean );

	useEffect( () => {
		// Update postMeta with filteredPostTypes if postMeta.postTypes does not loosely match.
		if (
			postMeta?.postTypes &&
			filteredPostTypes &&
			! flatUnorderedEquals( postMeta.postTypes, filteredPostTypes )
		) {
			updatePostMeta( 'postTypes', filteredPostTypes );
		}
		// We can ignore this because updatePostMeta is always created fresh on every render.
		// NOTE: make sure that other dependencies required are added in the future, as the linter could miss them here.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ postMeta.postTypes, filteredPostTypes ] );

	function updatePostMeta(
		metaKey: string,
		newValue: unknown,
		additionalMeta: { [ key: string ]: unknown } = {}
	) {
		editPost( {
			meta: {
				...postMeta,
				[ metaKey ]: newValue,
				...( Object.keys( additionalMeta ).length && {
					...additionalMeta,
				} ),
			},
		} );
	}

	/**
	 * Handler for ToggleControl component changes, targeting postMeta array values.
	 *
	 * If the event is truthy and the value does not currently exist in the targeted
	 * postMeta array, the value is added to a new array.
	 *
	 * Otherwise, the value is filtered out of a new array.
	 */
	function updatePostMetaMulti(
		isChecked: boolean,
		metaKey: string,
		metaValue: string
	) {
		updatePostMeta( metaKey, [
			...( isChecked && ! postMeta[ metaKey ]?.includes( metaValue )
				? [ ...postMeta[ metaKey ], metaValue ]
				: postMeta[ metaKey ].filter(
						( existingValue ) => existingValue !== metaValue
				  ) ),
		] );
	}

	return {
		queriedBlockTypes: blockTypes,
		queriedCategories: combinedCategories,
		queriedPostTypes: postTypes,
		updatePostMeta,
		updatePostMetaMulti,
	};
}
