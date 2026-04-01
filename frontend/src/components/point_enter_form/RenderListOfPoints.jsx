import { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } from '.../lib/ymaps';

const RenderListOfPoints = ({ listOfPoints }) => {  // ← 1. Деструктуризация пропсов
  return (
      <>
        {listOfPoints.map(marker => (
            <YMapMarker
                key={marker.id}
                coordinates={marker.coordinates}
            >
              <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#ff0000',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={marker.title}
              />
            </YMapMarker>
        ))}
      </>
  );
};