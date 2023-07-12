export class Menu {

}

/*

Custom Elements

1. Design a box element for all conventional application layout requirements.
2. Box can then be used for more specific layout types

<box height="24">
    <box align="left">
        <x-menu icon="menu" @click:toggle="AppState.ShowExplorerWindow"></boxy-menu-item>
        <x-menu icon="file" text="File>
            <x-menu icon="database" text="Change Namespace" @click:emit="ChangeNamespace" once="/namespace"></boxy-menu>
            <x-menu icon="file-plus" text="New Class">

            </x-menu>
        </menu>
    </box>
    <box align="center">

    </box>
    <box align="right">

    </box>
</box>

 */