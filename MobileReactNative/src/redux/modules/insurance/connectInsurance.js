import { connect } from 'react-redux';
import { insuranceActionCreators } from './actions';

function mapStateToProps({ insurance }) {
  return {
    insurance
  };
}

const mapDispatchToProps = insuranceActionCreators;

export function connectInsurance(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
