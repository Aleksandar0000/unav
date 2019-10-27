/*
 * uNav http://launchpad.net/unav
 * Copyright (C) 2016 Nekhelesh Ramananthan https://launchpad.net/~nik90
 *
 * uNav is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * uNav is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

import QtQuick 2.4
import Ubuntu.Components 1.3

AbstractButton {
    id: gridDelegate

    // Public APIs
    property alias icon: _icon
    property int highlightSize: units.gu(-2)

    width: units.gu(7)
    height: _icon.height
    
    Loader {
        sourceComponent: gridDelegate.pressed ? backgroundComponent : undefined
        anchors { fill: _icon; margins: highlightSize }
    }

    Component {
        id: backgroundComponent
        UbuntuShape {
            opacity: 0.15
            backgroundColor: UbuntuColors.darkGrey
        }
    }

    Icon {
        id: _icon
        width: height
        height: units.gu(4)
        anchors.centerIn: parent
    }
}

