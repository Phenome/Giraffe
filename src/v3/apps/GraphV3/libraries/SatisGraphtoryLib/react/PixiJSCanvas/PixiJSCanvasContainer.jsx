import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import useDimensions from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/hooks/useDimensions';
import PixiJSApplication from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/react/PixiJSCanvas/PixiJSApplication';

const useStyles = makeStyles((theme) =>
  createStyles({
    canvasContainer: {
      display: 'grid',
      gridArea: 'canvasArea',
      gridTemplateAreas: `"canvasElement"`,
      gridTemplateRows: 'minmax(0, 1fr)',
      gridTemplateColumns: '1fr',
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
    },
    canvas: {
      gridArea: 'canvasElement',
      minWidth: 0,
      minHeight: 0,
    },
  })
);

function PixiJSCanvasGuard(props) {
  const { height, width } = props;

  if (height === undefined || width === undefined) {
    return null;
  }

  return (
    <PixiJSApplication height={height} width={width}>
      {props.children}
    </PixiJSApplication>
  );
}

function PixiJSCanvasContainer(props) {
  const classes = useStyles();
  const [ref, { height, width }] = useDimensions();

  return (
    <div ref={ref} className={classes.canvasContainer}>
      <div className={classes.canvas}>
        <PixiJSCanvasGuard height={height} width={width} {...props} />
      </div>
    </div>
  );
}

export default PixiJSCanvasContainer;
