import Toast from 'react-native-toast-message';

function Toasts(props) {
  return (
    <>
      {/* ... */}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  );
}

export default Toasts;