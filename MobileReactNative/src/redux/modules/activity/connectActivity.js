import { connect } from 'react-redux';
import { activityActionCreators } from './actions';

function mapStateToProps({ activity }) {
  return {
    activity
  };
}

const mapDispatchToProps = activityActionCreators;

export function connectActivity(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
