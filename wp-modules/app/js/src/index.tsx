import { createRoot } from '@wordpress/element';
import App from './components/App';

const container = document.getElementById( 'pattern-manager-app' );
if ( container ) {
	createRoot( container ).render( <App /> );
}
