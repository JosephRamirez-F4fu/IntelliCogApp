import {
  Injectable,
  Injector,
  ApplicationRef,
  ComponentRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class OverlayModalService {
  private overlayRef?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  open<T>(component: any): ComponentRef<T> {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const portal = new ComponentPortal<T>(component, null, this.injector);
    const ref = this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.close());

    return ref;
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
