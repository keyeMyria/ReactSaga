import { connect } from 'react-redux';
import { settingActionCreators } from './actions';

function mapStateToProps({ setting }) {
  return {
    setting
  };
}

const mapDispatchToProps = settingActionCreators;

export function connectSetting(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
    mapDispatchToProps,
  );
}
