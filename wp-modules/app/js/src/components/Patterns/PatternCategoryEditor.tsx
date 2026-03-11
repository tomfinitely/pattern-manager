// WP dependencies
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { Icon, tag } from '@wordpress/icons';

// External dependencies
import Select from 'react-select';

// Globals
import { patternManager } from '../../globals';

// Hooks
import usePmContext from '../../hooks/usePmContext';

// Types
import type { Pattern } from '../../types';

type Option = { value: string; label: string };

type Props = {
	patternData: Pattern;
};

/** Render the category editor button and modal for a pattern. */
export default function PatternCategoryEditor( { patternData }: Props ) {
	const { patterns } = usePmContext();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ selected, setSelected ] = useState< Option[] >( [] );

	// Sync selected options with current pattern data each time the modal opens.
	useEffect( () => {
		if ( isOpen ) {
			setSelected(
				( patternData.categories ?? [] ).map( ( slug ) => {
					const found = patternManager.patternCategories.find(
						( c ) => c.name === slug
					);
					return { value: slug, label: found?.label ?? slug };
				} )
			);
		}
	}, [ isOpen, patternData.categories ] );

	const options: Option[] = patternManager.patternCategories.map( ( cat ) => ( {
		value: cat.name,
		label: cat.label,
	} ) );

	async function handleSave() {
		setIsSaving( true );
		await patterns.updatePatternCategories(
			patternData.name,
			selected.map( ( opt ) => opt.value )
		);
		setIsSaving( false );
		setIsOpen( false );
	}

	return (
		<>
			<Button
				className="item-action-button"
				aria-label={ sprintf(
					/* translators: %1$s: the pattern title */
					__( 'Edit categories for %1$s', 'pattern-manager' ),
					patternData.title
				) }
				onClick={ () => setIsOpen( true ) }
			>
				<Icon className="item-action-icon" icon={ tag } size={ 30 } />
				<span className="item-action-button-text">
					{ __( 'Categories', 'pattern-manager' ) }
				</span>
			</Button>

			{ isOpen && (
				<Modal
					title={ sprintf(
						/* translators: %1$s: the pattern title */
						__( 'Categories: %1$s', 'pattern-manager' ),
						patternData.title
					) }
					onRequestClose={ () => setIsOpen( false ) }
				>
					<Select
						isMulti
						isClearable
						closeMenuOnSelect={ false }
						aria-label={ __(
							'Select pattern categories',
							'pattern-manager'
						) }
						options={ options }
						value={ selected }
						onChange={ ( selections ) =>
							setSelected( [ ...selections ] )
						}
						menuPlacement="auto"
						styles={ {
							menu: ( base ) => ( { ...base, zIndex: 100 } ),
						} }
					/>
					<div
						style={ {
							display: 'flex',
							gap: '8px',
							marginTop: '16px',
						} }
					>
						<Button
							variant="primary"
							isBusy={ isSaving }
							onClick={ handleSave }
						>
							{ __( 'Save categories', 'pattern-manager' ) }
						</Button>
						<Button
							variant="tertiary"
							onClick={ () => setIsOpen( false ) }
						>
							{ __( 'Cancel', 'pattern-manager' ) }
						</Button>
					</div>
				</Modal>
			) }
		</>
	);
}
