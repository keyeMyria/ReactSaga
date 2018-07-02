import { connect } from 'react-redux';
import { patientActionCreators } from './actions';

function mapStateToProps({ patient }) {
  return {
    patient
  };
}

const mapDispatchToProps = patientActionCreators;

export function connectPatient(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
