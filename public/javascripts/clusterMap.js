
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'cluster-map',
  // Mapbox의 핵심 스타일 중에서 선택하거나 Mapbox Studio를 사용하여 자신만의 스타일을 만들 수 있습니다
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-103.5917, 40.6699],
  zoom: 3
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
  // GeoJSON 데이터에서 새로운 소스를 추가하고
  // '클러스터' 옵션을 true로 설정합니다. GL-JS는
  // 소스 데이터에 point_count 속성을 추가합니다.
  map.addSource('campgrounds', {
    type: 'geojson',
    // GeoJSON 데이터를 가리킵니다. 이 예는 모든 M1.0+ 지진을 시각화합니다
    // USGS의 지진 위험 프로그램에 의해 기록된 12/22/15부터 1/21/16까지.
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14, // 클러스터 포인트에 최대 확대
    clusterRadius: 50 // 점을 군집화할 때 각 군집의 반지름(기본값: 50)
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    paint: {
      // 단계식 사용(https://docs.mapbox.com/mapbox-gl-js/style-spec/ #configuration-step)
      // 세 가지 유형의 원을 구현하기 위한 세 가지 단계:
      // * 파란색, 포인트 수가 100 미만일 경우 20px 원
      // * 점 수가 100에서 750 사이일 때 노란색, 30px 원
      // * 점 수가 750 이상일 때 분홍색, 40px 원
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#00BCD4',
        10,
        '#2196F3',
        30,
        '#3F51B5'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        15,
        10,
        20,
        30,
        25
      ]
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  });

  //단일 지점
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'campgrounds',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  // 클릭하면 클러스터를 검사합니다
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('campgrounds').getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  });

  // 기능에서 클릭 이벤트가 발생할 때
  // 비클러스터된 점 도면층, 팝업 열기 위치
  // 피쳐의 위치, 포함
  // HTML 속성에서 설명합니다.
  map.on('click', 'unclustered-point', (e) => {
    console.log(e.features[0].properties.popUpMarkup);
    const popUpMarkup = e.features[0].properties.popUpMarkup;
    const coordinates = e.features[0].geometry.coordinates.slice();

    // 지도가 확대/축소된 경우 다음 사항을 확인합니다
    // 기능의 여러 복사본이 표시됩니다
    // 가리키는 복사본 위에 팝업이 나타납니다.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popUpMarkup)
      .addTo(map);
  });

  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  });
});
