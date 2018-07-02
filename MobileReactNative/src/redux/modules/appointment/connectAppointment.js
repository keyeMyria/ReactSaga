import { connect } from 'react-redux';
import { appointmentActionCreators } from './actions';

function mapStateToProps({ appointment }) {
  return {
    appointment
  };
}

const mapDispatchToProps = appointmentActionCreators;

export function connectAppointment(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
