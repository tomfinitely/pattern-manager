import { __ } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { Spinner } from '@wordpress/components';
import Select from 'react-select';
import { HelperTooltip } from '../Tooltips';

import type { BaseSidebarProps, AdditionalSidebarProps } from './types';
import type { ReactNode } from 'react';

/**
 * The panel section for restricting post types for the pattern.
 * Custom post types and certain core types are displayed as toggles.
 */
export default function PostTypesPanel( {
	children,
	postTypeOptions,
	postTypes,
	handleChange,
}: BaseSidebarProps< 'postTypes' > &
	AdditionalSidebarProps< 'postTypeOptions' > & {
		children: ReactNode;
	} ) {
	return (
		<PluginDocumentSettingPanel
			name="patternmanager-pattern-editor-pattern-post-types"
			title={ __( 'Post Types', 'pattern-manager' ) }
		>
			<HelperTooltip
				helperText={ __(
					'With no selections, this pattern will be available in the block inserter for all post types.',
					'pattern-manager'
				) }
				helperTitle={ __( 'Allowed post types', 'pattern-manager' ) }
			/>
			{ postTypeOptions ? (
				<Select
					isMulti
					isClearable
					closeMenuOnSelect={ false }
					classNamePrefix="pm-select"
					aria-label={ __( 'Select post types', 'pattern-manager' ) }
					value={ postTypes?.map( ( postType ) => {
						return postTypeOptions.find(
							( matchedPostType ) =>
								matchedPostType.value === postType
						);
					} ).filter( Boolean ) }
					options={ postTypeOptions }
					onChange={ ( postTypeSelections ) => {
						handleChange(
							'postTypes',
							postTypeSelections.map(
								( postType ) => postType.value
							)
						);
					} }
					menuPlacement="auto"
					styles={ {
						menu: ( base ) => ( {
							...base,
							zIndex: 100,
						} ),
					} }
				/>
			) : (
				<Spinner />
			) }
			{ children }
		</PluginDocumentSettingPanel>
	);
}
