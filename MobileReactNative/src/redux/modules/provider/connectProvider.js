import { connect } from 'react-redux';
import { providerActionCreators } from './actions';

function mapStateToProps({ provider }) {
  return {
    provider
  };
}

const mapDispatchToProps = providerActionCreators;

export function connectProvider(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
