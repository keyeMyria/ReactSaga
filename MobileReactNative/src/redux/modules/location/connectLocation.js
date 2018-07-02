import { connect } from 'react-redux';
import { locationActionCreators } from './actions';

function mapStateToProps({ location }) {
  return {
    location
  };
}

const mapDispatchToProps = locationActionCreators;

export function connectLocation(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
