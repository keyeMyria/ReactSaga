package com.openmed;

import android.content.Intent;
import android.view.View;
import android.widget.LinearLayout;
import io.branch.rnbranch.*; // <-- add this
import android.content.Intent; // <-- and this
import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {

    @Override
    public View createSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        return view;
    }

    @Override
    protected void onStart() {
        super.onStart();
        RNBranchModule.initSession(getIntent().getData(), this);
    }


    @Override
    protected void onNewIntent(Intent intent) {
        setIntent(intent);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
