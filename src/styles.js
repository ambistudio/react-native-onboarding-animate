import { StyleSheet, Dimensions } from 'react-native';

const Colors = {
  activeColor: '#2077E2',
  inactiveColor: 'rgba(0, 0, 0, 0.2)'
},
{ width } = Dimensions.get('window'),
Styles = {
  
  // 
  container: {
    flex: 1
  },
  
  //
  animatedContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1
  },
  
  // Scene Container
  sceneContainer: {
    flex: 1,
    paddingBottom: 100
  },
  
  // Navigation Buttons
  controllerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  activePageIndicatorWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10
  },
  activePageIndicator: {
      padding: 5
  },
  indicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors.inactiveColor
  },
  indicatorActive: {
      backgroundColor: Colors.activeColor
  },
  btnText: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors.activeColor
  },
  btnTextHiddden: {
      color: 'transparent'
  },
  btnPositive: {
      padding: 15,
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5
  },
  btnPositiveText: {
      color: 'white',
      fontWeight: '600'
  }
}

export default StyleSheet.create(Styles);
export {
  Colors
}