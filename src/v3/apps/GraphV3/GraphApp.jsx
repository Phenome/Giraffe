import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { Helmet } from 'react-helmet-async';
import ActionBar from 'v3/apps/GraphV3/components/ActionBar/ActionBar';
import Canvas from 'v3/apps/GraphV3/components/Canvas/Canvas';
// eslint-disable-next-line import/no-webpack-loader-syntax
// import worker from 'workerize-loader!./workertest';
import DebugFab from 'v3/apps/GraphV3/components/DebugFab/DebugFab';
import EdgeSelectorPanel from 'v3/apps/GraphV3/components/EdgeSelectorPanel/EdgeSelectorPanel';

import NavBar from 'v3/apps/GraphV3/components/NavBar/NarBar';
import { LocaleContext } from 'v3/components/LocaleProvider';
import uuidGen from 'v3/utils/stringUtils';

const useStyles = makeStyles((theme) => {
  return {
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      minHeight: theme.overrides.GraphAppBar.height,
    },
    container: {
      background: '#1D1E20',
      overflow: 'hidden',
      gridArea: 'body',
      display: 'grid',
      gridTemplateAreas: `"header"
        "contentArea"
        "bottomActions"`,
      gridTemplateRows: 'auto minmax(0, 1fr) auto',
      gridTemplateColumns: '1fr',
    },
    inProgressImage: {
      maxWidth: '100%',
      maxHeight: '100%',
      display: 'block',
    },
    flexItem: {
      flexGrow: 0,
    },
    flexItemGrow: {
      flexGrow: 1,
    },
    flexContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
  };
});

export default function GraphApp(props) {
  const [helmet, setHelmet] = React.useState({});

  const { language } = React.useContext(LocaleContext);

  const { match } = props;

  const classes = useStyles();

  const [data, setData] = React.useState({
    loaded: false,
    graph: {},
  });

  React.useEffect(() => {
    // let instance = worker();
    //
    // instance.expensive(1000).then(count => {
    //   console.log(`Ran ${count} loops`);
    // });
    // localizeGenerator(getAllRecipes())
  }, []);

  const onFinishLoad = React.useCallback(() => {
    window.prerenderReady = true;
    console.log('Finished loading');
  }, []);

  React.useEffect(() => {
    const graphId = (match && match.params && match.params.graphId) || null;
    let data;

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('useBlank')) {
      data = {
        d: 'AIACA===',
        c: 0,
        v: '0.1.0',
      };
    } else {
      data = {
        d:
          'CgAAAgCAEAQBAYEAgMQFASYBMACAOYMAwAKEAwAogIUCJAHgGBEDKAOAHDwAMAdAFkAbgAQBIAHgAJMAHQAjvACAAFgAFIgEFiQADgUBSZgDkAySCgA7EACiAzABKQXJAGuAsTgBGHoTAB8AEYBEEABUAAoaAEi8NBgAJJUAcDAADQBSgGoABQArAAWoGgAIgBUiACOADKL1AEIAaVcAaoBjIQUABrIAHPKVEABNByA=',
        c: 0,
        v: '0.1.0',
      };
    }

    if (graphId) {
      fetch(
        'https://www.googleapis.com/drive/v3/files/1parVWzimSkABuaUrS_TB9e-iaKOHsnIX?key=AIzaSyCZaipoQKvSrgNdQUZL_0Bc98SDG_Okcvs&alt=media'
      )
        .then((resp) => resp.json())
        .then((resp) => console.log('We were able to load!', resp))
        .finally(() => {
          setData({
            loaded: true,
            graph: {
              d: 'AIACA===',
              c: 0,
              v: '0.1.0',
            },
          });
        });

      // fetch('https://api.myjson.com/bins/' + graphId)
      //   .then((resp) => resp.json())
      //   .then((json) => {
      //     setHelmet(json);
      //   })
      //   .catch(() => {
      //     setHelmet({
      //       title: 'SatisGraphtory | Factory Building Graph Simulation',
      //       description:
      //         'Feature-rich factory optimization and calculation tool for Satisfactory game',
      //       image: 'https://i.imgur.com/DPEmxE0.png',
      //     });
      //   }).finally(() => {
      //   setData({
      //     loaded: true,
      //     graph: {derp: true}
      //   });
      // });
    } else {
      setHelmet({
        title: 'SatisGraphtory | Factory Building Graph Simulation',
        description:
          'Feature-rich factory optimization and calculation tool for Satisfactory game',
        image: 'https://i.imgur.com/DPEmxE0.png',
      });
      setData({
        loaded: true,
        graph: data,
      });
    }
  }, [language.code, match]);

  const [pixiCanvasStateId] = React.useState(() => {
    return uuidGen();
  });

  return (
    <React.Fragment>
      {Object.values(helmet).length > 0 ? (
        <div className={classes.container}>
          <Helmet>
            <meta property="og:title" content={helmet.title} />
            <meta property="og:site_name" content={window.location.hostname} />
            <meta property="og:image" content={helmet.image} />
            <meta property="og:description" content={helmet.description} />
            <meta property="og:url " content={window.location.href} />
            <title>{helmet.title}</title>
          </Helmet>
          <NavBar id={pixiCanvasStateId} loaded={data.loaded} />
          <Canvas
            dataLoaded={data.loaded}
            id={pixiCanvasStateId}
            initialCanvasGraph={data.graph}
            onFinishLoad={onFinishLoad}
          >
            {/*<ChainWizardPanel />*/}
            <ActionBar />
            <DebugFab />
            <EdgeSelectorPanel />
            {/*<SimulationFab />*/}
          </Canvas>
        </div>
      ) : (
        <div className={classes.container}>
          <NavBar id={pixiCanvasStateId} />
        </div>
      )}
    </React.Fragment>
  );
}
